#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <sys/inotify.h>
#include <unistd.h>
#include <fcntl.h>

#define EVENT_SIZE  ( sizeof (struct inotify_event) )
#define BUF_LEN     ( 1024 * ( EVENT_SIZE + 16 ) )
#define READ_BUF_SIZE 4096

void read_entire_file(const char* filename) {
    int fd = open(filename, O_RDONLY);
    if (fd == -1) {
        perror("open");
        return;
    }

    char buffer[READ_BUF_SIZE];
    ssize_t bytes_read;

    printf("Contents of %s:\n", filename);
    while ((bytes_read = read(fd, buffer, sizeof(buffer) - 1)) > 0) {
        buffer[bytes_read] = '\0';
        printf("%s", buffer);
    }
    printf("\n--- End of file ---\n");

    if (bytes_read == -1) {
        perror("read");
    }

    close(fd);
}

int main() {
    int fd, wd1, wd2;
    char buffer[BUF_LEN];

    fd = inotify_init();
    if (fd < 0) {
        perror("inotify_init");
        exit(1);
    }

    wd1 = inotify_add_watch(fd, "file1.txt", IN_MODIFY);
    wd2 = inotify_add_watch(fd, "file2.txt", IN_MODIFY);

    printf("Monitoring file1.txt and file2.txt for changes...\n");

    while (1) {
        int length = read(fd, buffer, BUF_LEN);
        if (length < 0) {
            perror("read");
            exit(1);
        }

        int i = 0;
        while (i < length) {
            struct inotify_event *event = (struct inotify_event *) &buffer[i];
            if (event->wd == wd1) {
                printf("file1.txt was modified\n");
                read_entire_file("file1.txt");
            } else if (event->wd == wd2) {
                printf("file2.txt was modified\n");
                read_entire_file("file2.txt");
            }
            i += EVENT_SIZE + event->len;
        }
    }

    inotify_rm_watch(fd, wd1);
    inotify_rm_watch(fd, wd2);
    close(fd);

    return 0;
}