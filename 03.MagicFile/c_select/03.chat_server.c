#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>

#define PORT 8080

int main() {
    int server_fd, new_socket, client_socket[30], max_clients = 30;
    int activity, i, valread;
    int max_sd;
    
    struct sockaddr_in address;
    
    char buffer[1025]; // Buffer for incoming messages
    
    // Set of socket descriptors
    fd_set readfds;

    // Initialize all client_socket[] to 0 so not checked
    for (i = 0; i < max_clients; i++) {
        client_socket[i] = 0;
    }

    // Create a master socket
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    
    if (server_fd == 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

   // Set master socket to allow multiple connections 
   int opt = 1;
   if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, (char *)&opt,
          sizeof(opt)) < 0) {
      perror("setsockopt");
      exit(EXIT_FAILURE);
   }

   address.sin_family = AF_INET;
   address.sin_addr.s_addr = INADDR_ANY;
   address.sin_port = htons(PORT);

   // Bind the socket to localhost port 8080
   if (bind(server_fd, (struct sockaddr *)&address,
            sizeof(address)) < 0) {
      perror("bind failed");
      exit(EXIT_FAILURE);
   }
   printf("Listener on port %d \n", PORT);

   // Try to specify maximum of 3 pending connections for the master socket
   if (listen(server_fd, 3) < 0) {
      perror("listen");
      exit(EXIT_FAILURE);
   }

   int addrlen = sizeof(address);
   puts("Waiting for connections ...");

   while (TRUE) {
      // Clear the socket set
      FD_ZERO(&readfds);

      // Add master socket to set
      FD_SET(server_fd, &readfds);
      max_sd = server_fd;

      // Add child sockets to set
      for (i = 0; i < max_clients; i++) {
         int sd = client_socket[i];

         // If valid socket descriptor then add to read list
         if (sd > 0)
            FD_SET(sd, &readfds);

         // Highest file descriptor number needed for select function
         if (sd > max_sd)
            max_sd = sd;
      }

      // Wait for an activity on one of the sockets , timeout is NULL , so wait indefinitely
      activity = select(max_sd + 1, &readfds, NULL, NULL, NULL);

      if ((activity < 0) && (errno != EINTR)) {
         printf("select error");
      }

      // If something happened on the master socket , then its an incoming connection
      if (FD_ISSET(server_fd, &readfds)) {
         if ((new_socket =
                 accept(server_fd, (struct sockaddr *)&address,
                        (socklen_t *)&addrlen)) < 0) {
            perror("accept");
            exit(EXIT_FAILURE);
         }

         printf("New connection , socket fd is %d , ip is : %s , port : %d \n ",
                new_socket,
                inet_ntoa(address.sin_addr), ntohs(address.sin_port));

         // Add new socket to array of sockets
         for (i = 0; i < max_clients; i++) {
            if (client_socket[i] == 0) {
               client_socket[i] = new_socket;
               printf("Adding to list of sockets as %d\n", i);
               break;
            }
         }
      }

      // Else it is some IO operation on some other socket 
      for (i = 0; i < max_clients; i++) {
         int sd = client_socket[i];

         if (FD_ISSET(sd, &readfds)) {
            // Check if it was for closing , and also read the incoming message
            if ((valread = read(sd , buffer, 1024)) == 0) {
               getpeername(sd , (struct sockaddr*)&address ,
                           (socklen_t*)&addrlen);
               printf("Host disconnected , ip %s , port %d \n" ,
                      inet_ntoa(address.sin_addr) , ntohs(address.sin_port));

               close(sd);
               client_socket[i] = 0;
            } else {
               buffer[valread] = '\0';
               send(sd , buffer , strlen(buffer) , 0 );
            }
         }
      }
   }

   return 0;
}