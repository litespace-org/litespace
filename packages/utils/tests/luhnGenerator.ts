// Generate Valid Luhn Number Function
export function generateValidLuhnNumber(length = 16): string {
  const digits = Array.from({ length: length - 1 }, () =>
    Math.floor(Math.random() * 10)
  );

  const sum = digits
    .slice()
    .reverse()
    .map((digit, idx) =>
      idx % 2 === 0 ? (digit * 2 > 9 ? digit * 2 - 9 : digit * 2) : digit
    )
    .reduce((acc, val) => acc + val, 0);

  const checkDigit = (10 - (sum % 10)) % 10;
  digits.push(checkDigit);

  return digits.join("");
}

// Generate Invalid Luhn Number Function
export function generateInvalidLuhnNumber(length = 16): string {
  const valid = generateValidLuhnNumber(length);
  const index = Math.floor(Math.random() * (length - 1));
  const wrongDigit = (Number(valid[index]) + 1) % 10;

  return valid.slice(0, index) + wrongDigit + valid.slice(index + 1);
}
