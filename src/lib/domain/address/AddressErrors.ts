// Domain-specific address errors
import { NotFoundError, DuplicateError } from "../shared/DomainError";

export class AddressNotFoundError extends NotFoundError {
  readonly code = "ADDRESS_NOT_FOUND";

  constructor(addressId?: string) {
    super("Address not found", { addressId });
  }
}

export class AddressDuplicateError extends DuplicateError {
  readonly code = "ADDRESS_DUPLICATE";

  constructor(message: string = "Address already exists") {
    super(message);
  }
}
