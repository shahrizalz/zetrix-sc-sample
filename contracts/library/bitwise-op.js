const BitwiseOp = function () {

    const self = this;

    // ── int64 operations ──────────────────────────────────────────────────────

    /**
     * Bitwise AND on two signed 64-bit integers.
     *
     * @param {string|number} a - Left operand.
     * @param {string|number} b - Right operand.
     * @returns {string} Result of a & b.
     */
    self.int64And = function (a, b) {
        return Utils.int64And(a, b);
    };

    /**
     * Bitwise OR on two signed 64-bit integers.
     *
     * @param {string|number} a - Left operand.
     * @param {string|number} b - Right operand.
     * @returns {string} Result of a | b.
     */
    self.int64Or = function (a, b) {
        return Utils.int64Or(a, b);
    };

    /**
     * Bitwise XOR on two signed 64-bit integers.
     *
     * @param {string|number} a - Left operand.
     * @param {string|number} b - Right operand.
     * @returns {string} Result of a ^ b.
     */
    self.int64Xor = function (a, b) {
        return Utils.int64Xor(a, b);
    };

    /**
     * Bitwise NOT on a signed 64-bit integer.
     *
     * @param {string|number} a - Operand.
     * @returns {string} Result of ~a.
     */
    self.int64Not = function (a) {
        return Utils.int64Not(a);
    };

    /**
     * Left shift on a signed 64-bit integer (<<).
     *
     * @param {string|number} a - Value to shift.
     * @param {string|number} b - Number of bit positions to shift left.
     * @returns {string} Result of a << b.
     */
    self.int64LShift = function (a, b) {
        return Utils.int64LShift(a, b);
    };

    /**
     * Arithmetic right shift on a signed 64-bit integer (>>).
     *
     * @param {string|number} a - Value to shift.
     * @param {string|number} b - Number of bit positions to shift right.
     * @returns {string} Result of a >> b (sign-extended).
     */
    self.int64RShift = function (a, b) {
        return Utils.int64RShift(a, b);
    };

    /**
     * Logical (unsigned) right shift on a 64-bit value (>>>).
     *
     * @param {string|number} a - Value to shift.
     * @param {string|number} b - Number of bit positions to shift right.
     * @returns {string} Result of a >>> b (zero-filled).
     */
    self.uint64RShift = function (a, b) {
        return Utils.uint64RShift(a, b);
    };

    // ── int256 operations ─────────────────────────────────────────────────────

    /**
     * Bitwise AND on two signed 256-bit integers.
     *
     * @param {string|number} a - Left operand.
     * @param {string|number} b - Right operand.
     * @returns {string} Result of a & b.
     */
    self.int256And = function (a, b) {
        return Utils.int256And(a, b);
    };

    /**
     * Bitwise OR on two signed 256-bit integers.
     *
     * @param {string|number} a - Left operand.
     * @param {string|number} b - Right operand.
     * @returns {string} Result of a | b.
     */
    self.int256Or = function (a, b) {
        return Utils.int256Or(a, b);
    };

    /**
     * Bitwise XOR on two signed 256-bit integers.
     *
     * @param {string|number} a - Left operand.
     * @param {string|number} b - Right operand.
     * @returns {string} Result of a ^ b.
     */
    self.int256Xor = function (a, b) {
        return Utils.int256Xor(a, b);
    };

    /**
     * Bitwise NOT on a signed 256-bit integer.
     *
     * @param {string|number} a - Operand.
     * @returns {string} Result of ~a.
     */
    self.int256Not = function (a) {
        return Utils.int256Not(a);
    };

    /**
     * Left shift on a signed 256-bit integer (<<).
     *
     * @param {string|number} a - Value to shift.
     * @param {string|number} b - Number of bit positions to shift left.
     * @returns {string} Result of a << b.
     */
    self.int256LShift = function (a, b) {
        return Utils.int256LShift(a, b);
    };

    /**
     * Arithmetic right shift on a signed 256-bit integer (>>).
     *
     * @param {string|number} a - Value to shift.
     * @param {string|number} b - Number of bit positions to shift right.
     * @returns {string} Result of a >> b (sign-extended).
     */
    self.int256RShift = function (a, b) {
        return Utils.int256RShift(a, b);
    };

    /**
     * Logical (unsigned) right shift on a 256-bit value (>>>).
     *
     * @param {string|number} a - Value to shift.
     * @param {string|number} b - Number of bit positions to shift right.
     * @returns {string} Result of a >>> b (zero-filled).
     */
    self.uint256RShift = function (a, b) {
        return Utils.uint256RShift(a, b);
    };
};
