exports.round = (number, decimals=2) => {

    return Math.round(number * Math.pow(10, decimals))/Math.pow(10, decimals);
}