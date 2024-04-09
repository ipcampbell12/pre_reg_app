const regex = /\b\d{8}\b/;
const myString = "1234567";

if (regex.test(myString)) {
    console.log("The string contains an 8-digit number.");
} else {
    console.log("The string does NOT contain an 8-digit number.");
}
