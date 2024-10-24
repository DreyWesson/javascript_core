#include <stdio.h>
#include <sys/select.h>
#include <unistd.h>

//  Monitoring a Single File Descriptor

int main()
{
    fd_set read_fds;
    // struct timeval timeout; // **** 2
    int retval;

    // while (1)    // ***** 1
    // {    
        FD_ZERO(&read_fds);
        FD_SET(STDIN_FILENO, &read_fds);

        // timeout.tv_sec = 5;
        // timeout.tv_usec = 0;

        retval = select(STDIN_FILENO + 1, &read_fds, NULL, NULL, NULL); // *2 change last arg to addr of timeout ie &timeout

        if (retval == -1)
        {
            perror("select()");
        }
        else if (retval)
        {
            printf("Data is available now.\n");
            char buffer[100];
            read(STDIN_FILENO, buffer, sizeof(buffer));
            printf("You entered: %s\n", buffer);
        }
        // else
        //     printf("No data within five seconds.\n"); // **** 2
    // }    
    return 0;
}