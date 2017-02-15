
// Returns true if value is numeric in any way:
// 3    {true}
// '3'  {true}
// 'a'  {false}
// '3a' {false}
this.isNumeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

module.exports = this;
