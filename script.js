import fs from "fs";
import path from "path";
import { parse, stringify } from "csv";
import iconv from "iconv-lite";
import { Faker, sk } from "@faker-js/faker";

// Nastavenie faker s lokalizáciou na Slovensko
export const faker = new Faker({ locale: sk });

// Funkcia na určenie pohlavia na základe priezviska
function getGenderFromLastName(lastName) {
  return lastName.endsWith("ová") ? "female" : "male";
}

// Funkcia na úpravu dát s použitím faker, ktorá sa vykoná len ak je USERSTATUS neprázdny
function anonymizeData(records) {
  return records.map((row) => {
    // Kontrola, či je stĺpec USERSTATUS neprázdny
    if (row.USERSTATUS && row.USERSTATUS.trim() !== "") {
      if ("LASTNAME" in row) {
        // Určenie pohlavia na základe priezviska
        const gender = getGenderFromLastName(row.LASTNAME);

        // Generovanie falošného mena a emailu na základe pohlavia
        row.LASTNAME =
          gender === "female"
            ? faker.person.lastName("female")
            : faker.person.lastName("male");
        row.FIRSTNAME =
          gender === "female"
            ? faker.person.firstName("female")
            : faker.person.firstName("male");
        row.EMAIL = faker.internet.email(row.FIRSTNAME, row.LASTNAME);
      }
    }
    return row;
  });
}

// Načítanie názvu vstupného súboru z argumentov príkazového riadku
const inputFilePath = process.argv[2];

if (!inputFilePath) {
  console.error("Prosím, zadaj cestu k vstupnému súboru ako argument.");
  process.exit(1);
}

// Dynamické nastavenie výstupného súboru s časovou značkou
const timestamp = new Date();
const formattedDate = `${timestamp.getDate().toString().padStart(2, "0")}-${(
  timestamp.getMonth() + 1
)
  .toString()
  .padStart(2, "0")}-${timestamp.getFullYear()}-${timestamp
  .getHours()
  .toString()
  .padStart(2, "0")}-${timestamp
  .getMinutes()
  .toString()
  .padStart(2, "0")}-${timestamp.getSeconds().toString().padStart(2, "0")}`;

const inputFileName = path.basename(inputFilePath, path.extname(inputFilePath));
const outputFilePath = `${inputFileName}-output-${formattedDate}.csv`;

// Čítanie a dekódovanie CSV súboru
fs.readFile(inputFilePath, (err, data) => {
  if (err) {
    console.error("Chyba pri čítaní súboru:", err);
    process.exit(1);
  }

  // Dekódovanie vstupného súboru z kódovania win1250
  const decodedData = iconv.decode(data, "win1250");

  // Parsovanie CSV obsahu
  parse(
    decodedData,
    { columns: true, trim: true, delimiter: ";" },
    (err, records) => {
      if (err) {
        console.error("Chyba pri parsovaní CSV:", err);
        process.exit(1);
      }

      // Anonymizácia dát pomocou funkcie anonymizeData
      const modifiedRecords = anonymizeData(records);

      // Zápis upravených dát do nového CSV súboru s kódovaním win1250
      stringify(
        modifiedRecords,
        { header: true, delimiter: ";" },
        (err, output) => {
          if (err) {
            console.error("Chyba pri vytváraní CSV:", err);
            process.exit(1);
          }

          // Zakódovanie do win1250 a zápis do súboru
          const encodedOutput = iconv.encode(output, "win1250");
          fs.writeFile(outputFilePath, encodedOutput, (err) => {
            if (err) {
              console.error("Chyba pri zápise súboru:", err);
              process.exit(1);
            }

            console.log(`Údaje boli zapísané do súboru ${outputFilePath}`);
            process.exit(0);
          });
        }
      );
    }
  );
});
