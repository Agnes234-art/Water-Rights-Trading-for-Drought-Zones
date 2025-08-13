
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("Water Rights Trading Contract Tests", () => {
  it("ensures simnet is well initialised", () => {
    expect(simnet.blockHeight).toBeDefined();
  });

  it("should register water allocation", () => {
    const { result } = simnet.callPublicFn(
      "Water-Right-Trading",
      "register-water-allocation",
      [
        simnet.types.uint(1000),
        simnet.types.ascii("California Central Valley"),
        simnet.types.uint(1000)
      ],
      address1
    );
    expect(result).toBeOk(simnet.types.uint(1000));
  });

  it("should get water allocation", () => {
    // First register an allocation
    simnet.callPublicFn(
      "Water-Right-Trading",
      "register-water-allocation",
      [
        simnet.types.uint(1000),
        simnet.types.ascii("California Central Valley"),
        simnet.types.uint(1000)
      ],
      address1
    );

    // Then get it
    const { result } = simnet.callReadOnlyFn(
      "Water-Right-Trading",
      "get-water-allocation",
      [simnet.types.principal(address1)],
      address1
    );
    expect(result).toBeSome();
  });

  it("should create a listing", () => {
    // First register an allocation
    simnet.callPublicFn(
      "Water-Right-Trading",
      "register-water-allocation",
      [
        simnet.types.uint(1000),
        simnet.types.ascii("California Central Valley"),
        simnet.types.uint(1000)
      ],
      address1
    );

    // Then create a listing
    const { result } = simnet.callPublicFn(
      "Water-Right-Trading",
      "create-listing",
      [
        simnet.types.uint(100),
        simnet.types.uint(50),
        simnet.types.uint(100)
      ],
      address1
    );
    expect(result).toBeOk(simnet.types.uint(1));
  });

  it("should transfer water rights", () => {
    // First register an allocation
    simnet.callPublicFn(
      "Water-Right-Trading",
      "register-water-allocation",
      [
        simnet.types.uint(1000),
        simnet.types.ascii("California Central Valley"),
        simnet.types.uint(1000)
      ],
      address1
    );

    // Then transfer some rights
    const { result } = simnet.callPublicFn(
      "Water-Right-Trading",
      "transfer-water-rights",
      [
        simnet.types.principal(address2),
        simnet.types.uint(100)
      ],
      address1
    );
    expect(result).toBeOk(simnet.types.uint(100));
  });
});
