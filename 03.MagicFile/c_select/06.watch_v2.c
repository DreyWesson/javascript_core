#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <sys/inotify.h>
#include <unistd.h>
#include <fcntl.h>
#include <signal.h>

#define EVENT_SIZE  (sizeof(struct inotify_event))
#define BUF_LEN     (1024 * (EVENT_SIZE + 16))
#define MAX_FILENAME 256
#define MAX_WATCHED_FILES 10

typedef struct {
    int wd;
    char filename[MAX_FILENAME];
} WatchedFile;

static int fd_inotify = -1;
static WatchedFile watched_files[MAX_WATCHED_FILES];
static int num_watched_files = 0;

void handle_error(const char* msg) {
    perror(msg);
    exit(EXIT_FAILURE);
}

void cleanup() {
    if (fd_inotify != -1) {
        for (int i = 0; i < num_watched_files; i++) {
            inotify_rm_watch(fd_inotify, watched_files[i].wd);
        }
        close(fd_inotify);
    }
}

void signal_handler(int signo) {
    printf("\nReceived signal %d. Cleaning up and exiting...\n", signo);
    cleanup();
    exit(EXIT_SUCCESS);
}

void read_entire_file(const char* filename) {
    char buffer[4096];
    ssize_t bytes_read;
    int fd = open(filename, O_RDONLY);
    if (fd == -1) {
        fprintf(stderr, "Error opening %s: %s\n", filename, strerror(errno));
        return;
    }

    printf("Contents of %s:\n", filename);
    while ((bytes_read = read(fd, buffer, sizeof(buffer) - 1)) > 0) {
        buffer[bytes_read] = '\0';
        printf("%s", buffer);
    }
    printf("\n--- End of file ---\n");

    if (bytes_read == -1) {
        fprintf(stderr, "Error reading %s: %s\n", filename, strerror(errno));
    }

    close(fd);
}

int add_watch(const char* filename) {
    if (num_watched_files >= MAX_WATCHED_FILES) {
        fprintf(stderr, "Maximum number of watched files reached.\n");
        return -1;
    }

    int wd = inotify_add_watch(fd_inotify, filename, IN_MODIFY);
    if (wd == -1) {
        fprintf(stderr, "Error watching %s: %s\n", filename, strerror(errno));
        return -1;
    }

    watched_files[num_watched_files].wd = wd;
    strncpy(watched_files[num_watched_files].filename, filename, MAX_FILENAME - 1);
    watched_files[num_watched_files].filename[MAX_FILENAME - 1] = '\0';
    num_watched_files++;

    printf("Now watching: %s\n", filename);
    return wd;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <file1> [file2] ...\n", argv[0]);
        exit(EXIT_FAILURE);
    }

    signal(SIGINT, signal_handler);
    signal(SIGTERM, signal_handler);

    fd_inotify = inotify_init();
    if (fd_inotify == -1) {
        handle_error("inotify_init");
    }

    for (int i = 1; i < argc && i <= MAX_WATCHED_FILES; i++) {
        add_watch(argv[i]);
    }

    char buffer[BUF_LEN];
    printf("Monitoring files for changes. Press Ctrl+C to exit.\n");

    while (1) {
        int length = read(fd_inotify, buffer, BUF_LEN);
        if (length == -1 && errno != EINTR) {
            handle_error("read");
        }

        int i = 0;
        while (i < length) {
            struct inotify_event *event = (struct inotify_event *)&buffer[i];
            for (int j = 0; j < num_watched_files; j++) {
                if (event->wd == watched_files[j].wd) {
                    printf("%s was modified\n", watched_files[j].filename);
                    read_entire_file(watched_files[j].filename);
                    break;
                }
            }
            i += EVENT_SIZE + event->len;
        }
    }

    cleanup();
    return 0;
}