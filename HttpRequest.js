class HttpRequest {
    constructor() {
      this.method = '';
      this.uri = '';
      this.scheme = '';
      this.authority = '';
      this.path = '';
      this.query = '';
      this.fragment = '';
      this.target = '';
      this.protocol = 'HTTP/1.1';
      this.headers = {};
      this.body = '';
      this.reqBuffer = '';
      this.length = 0;
      this.chunkSize = 0;
      this.isChunked = false;
      this.bodyOffset = 0;
      this.bufferSection = 'REQUEST_LINE';
      this.chunkStatus = 'CHUNK_SIZE';
      this.uriSuffix = '';
      this.startTime = Date.now();
      this.lastTime = Date.now();
    }
  
    parseRequest(buffer) {
      this.reqBuffer += buffer;
  
      try {
        switch (this.bufferSection) {
          case 'REQUEST_LINE':
            this.parseRequestLine();
            break;
          case 'HEADERS':
            this.parseHeaders();
            break;
          case 'SPECIAL_HEADERS':
            this.checkSpecialHeaders();
            break;
          case 'BODY':
            this.parseBody();
            break;
          case 'CHUNK':
            this.parseChunkedBody();
            break;
        }
  
        if (this.bufferSection === 'COMPLETE') {
          return 200; // Request completed successfully
        } else if (this.bufferSection === 'ERROR') {
          return 400; // Error in parsing
        }
  
        return 100; // Continue processing
      } catch (error) {
        console.error(`Error parsing request: ${error.message}`);
        this.bufferSection = 'ERROR';
        return 500; // Internal server error
      }
    }
  
    parseRequestLine() {
      const endOfFirstLine = this.reqBuffer.indexOf('\r\n');
      if (endOfFirstLine === -1) return;
  
      const requestLine = this.reqBuffer.slice(0, endOfFirstLine);
      const [method, uri, protocol] = requestLine.split(' ');
  
      if (!method || !uri || !protocol) {
        this.bufferSection = 'ERROR';
        throw new Error('Invalid request line');
      }
  
      this.method = method;
      this.uri = uri;
      this.protocol = protocol;
      this.bufferSection = 'HEADERS';
      this.reqBuffer = this.reqBuffer.slice(endOfFirstLine + 2);
    }
  
    parseHeaders() {
      const headerEnd = this.reqBuffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
  
      const headerLines = this.reqBuffer.slice(0, headerEnd).split('\r\n');
      headerLines.forEach(line => {
        const [key, value] = line.split(':').map(str => str.trim());
        if (key && value) {
          this.headers[key.toLowerCase()] = value;
        }
      });
  
      this.reqBuffer = this.reqBuffer.slice(headerEnd + 4);
      this.bufferSection = this.headers['transfer-encoding'] === 'chunked' ? 'CHUNK' : 'BODY';
    }
  
    parseBody() {
      const contentLength = parseInt(this.headers['content-length'], 10);
      if (!contentLength || this.reqBuffer.length < contentLength) return;
  
      this.body = this.reqBuffer.slice(0, contentLength);
      this.reqBuffer = this.reqBuffer.slice(contentLength);
      this.bufferSection = 'COMPLETE';
    }
  
    parseChunkedBody() {
      while (this.reqBuffer.includes('\r\n')) {
        const endOfSize = this.reqBuffer.indexOf('\r\n');
        const chunkSizeHex = this.reqBuffer.slice(0, endOfSize);
        const chunkSize = parseInt(chunkSizeHex, 16);
  
        if (isNaN(chunkSize)) {
          this.bufferSection = 'ERROR';
          return;
        }
  
        this.reqBuffer = this.reqBuffer.slice(endOfSize + 2);
  
        if (chunkSize === 0) {
          this.bufferSection = 'COMPLETE';
          return;
        }
  
        if (this.reqBuffer.length >= chunkSize) {
          this.body += this.reqBuffer.slice(0, chunkSize);
          this.reqBuffer = this.reqBuffer.slice(chunkSize + 2); // Skip \r\n after chunk
        } else {
          return; // Wait for more data
        }
      }
    }
  
    checkSpecialHeaders() {
      if (this.headers['content-length']) {
        this.length = parseInt(this.headers['content-length'], 10);
        this.bufferSection = 'BODY';
      } else if (this.headers['transfer-encoding'] === 'chunked') {
        this.isChunked = true;
        this.bufferSection = 'CHUNK';
      } else {
        this.bufferSection = 'COMPLETE';
      }
    }
  
    getMethod() {
      return this.method;
    }
  
    getURI() {
      return this.uri;
    }
  
    getProtocol() {
      return this.protocol;
    }
  
    getHeaders() {
      return this.headers;
    }
  
    getBody() {
      return this.body;
    }
  
    // Other methods to get specific headers, path, query, etc.
  }

  module.exports = HttpRequest;