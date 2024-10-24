// producer-consumer scenario where one process generates data and another consumes it
// Non-blocking I/O with Select for Inter-Process Communication
#include <stdio.h>
#include <sys/select.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>  // For strlen

int main() {
    int pipefd[2];

    // Create a pipe
    if (pipe(pipefd) == -1) {
        perror("pipe");
        return 1;
    }

    fd_set read_fds, write_fds;

    while (1) {
        FD_ZERO(&read_fds);
        FD_ZERO(&write_fds);

        
        FD_SET(STDIN_FILENO, &read_fds); // Monitor stdin for reading

        
        FD_SET(pipefd[1], &write_fds); // Monitor the write end of the pipe for writability

        // Wait for input on stdin or the pipe to be writable
        int max_fd = (pipefd[1] > STDIN_FILENO) ? pipefd[1] : STDIN_FILENO;

        int retval = select(max_fd + 1, &read_fds, &write_fds, NULL, NULL);

        if (retval == -1) {
            perror("select");
            break;
        }

        // Check if there's input from stdin
        if (FD_ISSET(STDIN_FILENO, &read_fds)) {
            char buffer[100];
            ssize_t bytes_read = read(STDIN_FILENO, buffer, sizeof(buffer) - 1);
            if (bytes_read > 0) {
                buffer[bytes_read] = '\0';
                // Check if the pipe is writable before writing
                if (FD_ISSET(pipefd[1], &write_fds)) {
                    ssize_t bytes_written = write(pipefd[1], buffer, bytes_read);
                    if (bytes_written == -1) {
                        perror("write error");
                        break;
                    } else {
                        printf("Wrote %zd bytes to the pipe: %s", bytes_written, buffer);
                    }
                }
            } else {
                printf("No data read from stdin.\n");
            }
        }
    }

    // Close the pipe
    close(pipefd[0]);
    close(pipefd[1]);

    return 0;
}
