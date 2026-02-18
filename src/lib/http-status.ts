/**
 * http-status.ts
 *
 * Provides HTTP response codes and custom sub-classes of the Error class that represent HTTP errors.
 *
 * @author Dave Welsh <dave@qccareerschool.com>
 * @version 1.0.0
 * @copyright 7904215 Canada Inc
 */

const TYPE_INFORMATIONAL = 100;
const TYPE_SUCCESS = 200;
const TYPE_REDIRECTION = 300;
const TYPE_CLIENT_ERROR = 400;
const TYPE_SERVER_ERROR = 500;

export const CONTINUE = 100;
export const SWITCHING_PROTOCOLS = 101;
export const PROCESSING = 102;
export const OK = 200;
export const CREATED = 201;
export const ACCEPTED = 202;
export const NO_CONTENT = 204;
export const RESET_CONTENT = 205;
export const PARTIAL_CONTENT = 206;
export const MULTI_STATUS = 207;
export const ALREADY_REPORTED = 208;
export const IM_USED = 209;
export const MULTIPLE_CHOICES = 300;
export const MOVED_PERMANENTLY = 301;
export const FOUND = 302;
export const SEE_OTHER = 303;
export const NOT_MODIFIED = 304;
export const USE_PROXY = 305;
export const SWITCH_PROXY = 306;
export const TEMPORARY_REDIRECT = 307;
export const PERMANENT_REDIRECT = 308;
export const BAD_REQUEST = 400;
export const UNAUTHORIZED = 401;
export const PAYMENT_REQUIRED = 402;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;
export const METHOD_NOT_ALLOWED = 405;
export const NOT_ACCEPTABLE = 406;
export const PROXY_AUTHENTICATION_REQUIRED = 407;
export const REQUEST_TIMEOUT = 408;
export const CONFLICT = 409;
export const GONE = 410;
export const LENGTH_REQUIRED = 411;
export const PRECONDITION_FAILED = 412;
export const PAYLOAD_TOO_LARGE = 413;
export const URI_TOO_LONG = 414;
export const UNSUPPORTED_MEDIA_TYPE = 415;
export const RANGE_NOT_SATISFIABLE = 416;
export const EXPECTATION_FAILED = 417;
export const IM_A_TEAPOT = 418;
export const MISDIRECTED_REQUEST = 421;
export const UNPROCESSABLE_ENTITY = 422;
export const LOCKED = 423;
export const FAILED_DEPENDENCY = 424;
export const UPGRADE_REQUIRED = 426;
export const PRECONDITION_REQUIRED = 428;
export const TOO_MANY_REQUESTS = 429;
export const REQUEST_HEADER_FIELDS_TOO_LARGE = 431;
export const UNAVAILABLE_FOR_LEGAL_REASONS = 451;
export const INTERNAL_SERVER_ERROR = 500;
export const NOT_IMPLEMENTED = 501;
export const BAD_GATEWAY = 502;
export const SERVICE_UNAVAILABLE = 503;
export const GATEWAY_TIMEOUT = 504;
export const HTTP_VERSION_NOT_SUPPORTED = 505;
export const VARIANT_ALSO_NEGOTIATES = 506;
export const INSUFFICIENT_STORAGE = 507;
export const LOOP_DETECTED = 508;
export const NOT_EXTENDED = 510;
export const NETWORK_AUTHENTICATION_REQUIRED = 511;

/**
 * Abstract parent class
 */
export class HttpResponse extends Error {

  public constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Error.captureStackTrace(this, (this as any).contructor);
    }
  }

  /** The response is informational with a status code 1XX */
  public isInformational(): boolean {
    return this.statusCode >= TYPE_INFORMATIONAL && this.statusCode < TYPE_SUCCESS;
  }

  /** The response indicates success with a status code 2XX */
  public isSuccess(): boolean {
    return this.statusCode >= TYPE_SUCCESS && this.statusCode < TYPE_REDIRECTION;
  }

  /** The response indicates redirection with a status code 3XX */
  public isRedirection(): boolean {
    return this.statusCode >= TYPE_REDIRECTION && this.statusCode < TYPE_CLIENT_ERROR;
  }

  /** The response indicates a client error with a status code 4XX */
  public isClientError(): boolean {
    return this.statusCode >= TYPE_CLIENT_ERROR && this.statusCode < TYPE_SERVER_ERROR;
  }

  /** The response indicates a server error with a status code 5XX */
  public isServerError(): boolean {
    return this.statusCode >= TYPE_SERVER_ERROR;
  }
}

/**
 * 400 Bad Request
 */
export class BadRequest extends HttpResponse {
  public constructor(message?: string) {
    if (typeof message === 'undefined') {
      super(BAD_REQUEST, 'Bad Request');
    } else {
      super(BAD_REQUEST, message);
    }
  }
}

/**
 * 401 Unauthorized
 */
export class Unauthorized extends HttpResponse {
  public constructor(message?: string) {
    if (typeof message === 'undefined') {
      super(UNAUTHORIZED, 'Unauthorized');
    } else {
      super(UNAUTHORIZED, message);
    }
  }
}

/**
 * 403 Forbidden
 */
export class Forbidden extends HttpResponse {
  public constructor(message?: string) {
    if (typeof message === 'undefined') {
      super(FORBIDDEN, 'Forbidden');
    } else {
      super(FORBIDDEN, message);
    }
  }
}

/**
 * 404 Not Found
 */
export class NotFound extends HttpResponse {
  public constructor(message?: string) {
    if (typeof message === 'undefined') {
      super(NOT_FOUND, 'Not Found');
    } else {
      super(NOT_FOUND, message);
    }
  }
}

/**
 * 409 Conflict
 */
export class Conflict extends HttpResponse {
  public constructor(message?: string) {
    if (typeof message === 'undefined') {
      super(CONFLICT, 'Conflict');
    } else {
      super(CONFLICT, message);
    }
  }
}

/**
 * 422 Unprocessable Entity
 */
export class UnprocessableEntity extends HttpResponse {
  public constructor(message?: string) {
    if (typeof message === 'undefined') {
      super(UNPROCESSABLE_ENTITY, 'Unprocessable Entity');
    } else {
      super(UNPROCESSABLE_ENTITY, message);
    }
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends HttpResponse {
  public constructor(message?: string) {
    if (typeof message === 'undefined') {
      super(INTERNAL_SERVER_ERROR, 'Internal Server Error');
    } else {
      super(INTERNAL_SERVER_ERROR, message);
    }
  }
}
