const ymdh = /^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/;

export const RegExPatterns = {
    YearMonthDateWithHyphen: ymdh,
    GroupId: /^([a-zA-Z0-9-]{2,50})$/,
    firstName: /^([a-zA-Z]{1,50})$/,
    TwoDigitNumber: /^([0-9]{1,2})$/,
    TwoWordsWithSpace: /^[a-zA-Z]+(?:[\s.]+[a-zA-Z]+)*$/,
    FairwayDomain: /\@fairwaymc\.com$/,
};
