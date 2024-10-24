#include <stdio.h>
#include <sys/select.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <string.h>

#define BUFFER_SIZE 1024

int main() {
    fd_set readfds;
    int fd1, fd2;
    char buffer[BUFFER_SIZE];
    struct timeval tv;

    fd1 = open("file1.txt", O_RDONLY);
    fd2 = open("file2.txt", O_RDONLY);

    if (fd1 == -1 || fd2 == -1) {
        perror("open()");
        return 1;
    }

    // Set both file descriptors to non-blocking mode
    fcntl(fd1, F_SETFL, fcntl(fd1, F_GETFL) | O_NONBLOCK);
    fcntl(fd2, F_SETFL, fcntl(fd2, F_GETFL) | O_NONBLOCK);

    while (1) {
        FD_ZERO(&readfds);
        FD_SET(fd1, &readfds);
        FD_SET(fd2, &readfds);

        int max_fd = (fd1 > fd2 ? fd1 : fd2) + 1;

        // Set timeout to 1 second
        tv.tv_sec = 1;
        tv.tv_usec = 0;

        int retval = select(max_fd, &readfds, NULL, NULL, &tv);

        if (retval == -1) {
            perror("select()");
            break;
        } else if (retval) {
            if (FD_ISSET(fd1, &readfds)) {
                int bytes_read = read(fd1, buffer, sizeof(buffer) - 1);
                if (bytes_read > 0) {
                    buffer[bytes_read] = '\0';
                } else if (bytes_read == -1 && errno != EAGAIN) {
                    perror("read file1");
                    close(fd1);
                    FD_CLR(fd1, &readfds);
                }
            }
            if (FD_ISSET(fd2, &readfds)) {
                int bytes_read = read(fd2, buffer, sizeof(buffer) - 1);
                if (bytes_read > 0) {
                    buffer[bytes_read] = '\0';
                } else if (bytes_read == -1 && errno != EAGAIN) {
                    perror("read file2");
                    close(fd2);
                    FD_CLR(fd2, &readfds);
                }
            }
        } else {
            printf("Waiting for new data...\n");
        }

        if (!FD_ISSET(fd1, &readfds) && !FD_ISSET(fd2, &readfds)) {
            break; // Both files are closed, exit loop
        }
    }

    close(fd1);
    close(fd2);
    return 0;
}