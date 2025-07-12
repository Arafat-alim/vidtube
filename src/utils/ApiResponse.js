class ApiResponse {
  /**
   * @param {number} statusCode - The HTTP status code.
   * @param {any} data - The payload to be sent.
   * @param {string} [message='Success'] - A descriptive message.
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
