# Users anonymizer

### inštalácia

stiahni alebo naklonuj repozitár `https://github.com/winnysan/users-anonymizer.git`

a spusti `npm install`

### spustenie

nahraj do adresára `csv` súbor, a v termináli spusti príkaz

```bash
npm run anonymize <názov-súboru>.csv
# napríklad: npm run anonymize UsersEmploees.csv
```

vytvorí sa anonymizovaný súbor `<povodný-nazov-súboru>-output-dd-mm-yyyy-hh-mm-ss`

upravené budú hodnoty stĺpcov `LASTNAME`,`FIRSTNAME`,`EMAIL`, ale len v prípade, že hodnota `USERSTATUS` nie je prázdna
