const SafeMath = function () {

    const self = this;

    // ── uint64 ──────────────────────────────────────────────────────────────

    self.uint64Add = function (x, y) {
        return Utils.uint64Add(x, y);
    };

    self.uint64Sub = function (x, y) {
        return Utils.uint64Sub(x, y);
    };

    self.uint64Mul = function (x, y) {
        return Utils.uint64Mul(x, y);
    };

    self.uint64Div = function (x, y) {
        return Utils.uint64Div(x, y);
    };

    self.uint64Mod = function (x, y) {
        return Utils.uint64Mod(x, y);
    };

    self.uint64Compare = function (x, y) {
        return Utils.uint64Compare(x, y);
    };

    self.stoui64Check = function (s) {
        return Utils.stoui64Check(s);
    };

    // ── uint256 ─────────────────────────────────────────────────────────────

    self.uint256Add = function (x, y) {
        return Utils.uint256Add(x, y);
    };

    self.uint256Sub = function (x, y) {
        return Utils.uint256Sub(x, y);
    };

    self.uint256Mul = function (x, y) {
        return Utils.uint256Mul(x, y);
    };

    self.uint256Div = function (x, y) {
        return Utils.uint256Div(x, y);
    };

    self.uint256Mod = function (x, y) {
        return Utils.uint256Mod(x, y);
    };

    self.uint256Compare = function (x, y) {
        return Utils.uint256Compare(x, y);
    };

    self.stoui256Check = function (s) {
        return Utils.stoui256Check(s);
    };

};
