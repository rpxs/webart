const fs = require("fs");

const fonts = [
  "/NimbusSanL-Reg.otf",
  "/texgyreheroscn-bold.otf",
  "/texgyreheroscn-bold.otf",
  "/LiberationSans-Bold.ttf",
];

function prepareTextData(inputString, colorOptions, sizeRange) {
  // Remove newlines, commas, and semicolons
  const cleanedString = inputString.replace(/[\n,;]/g, "");

  // Generate random words from the cleaned string
  const words = cleanedString
    .split(" ")
    // .map((word) => word.toLowerCase())
    .filter((word) => word.trim().length > 0);

  // Create array to store objects with text styling properties
  const textItems = words.map((word) => {
    const font = fonts[Math.floor(Math.random() * fonts.length)];
    const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    const size =
      Math.floor(Math.random() * (sizeRange.max - sizeRange.min + 1)) +
      sizeRange.min;
    return { word, font, color, size };
  });

  return textItems;
}

// Example usage
const inputString = `
  I pull up with like fifteen black trucks I feel like the president
  Two hundred and fifty thousand yeah that's how my day was spent
  I stuff that shit in my trousers yeah-yeah-yeah they Givenchy

  What I spent on lean I could've went and bought Mercedes-Benz
  She said she feelin' me but I think I wanna go and fuck her friend
  I'm on tour bitch but I still linked up with the X-Man
  Count up money and pourin' up drank this shit just like Ed and Eddy
  Huh every day I'm fresh with the swag I go spendin'
  Huh upside-down cross all baguettes go spaghetti

  Huh I'm havin' new cheese huh Lone having fetty
  Huh just like Little Caesars boy I know that you ready
  Huh my swag cause a frenzy got these niggas jealous
  And I ain't got no envy in me that's why my pockets heavy

  I want the whole load nothin' less
  I want the whole bag nothin' less
  I poured a whole pint bitch nothin' less
  I spent a whole wad of cash nothin' less
  I ain't got no envy in me bitch that's why my pockets heavy
  I keep counting up the M and M's put Wafi on my necklace
  Me and gang switch the swag up quick tell her "Check it"

  I put that bitch in a Jag' huh she used to drive a Lexus
  I got a bitch with a fat ass huh huh she from Texas
  I got this model ho she super skinny all she do is neck
  I fuck all type of hoes huh I'm complex
  Like the nigga from Fantastic Four make the money stretch
  I got this bitch throwin' up O she throwin' up the set
  I live my life on private that's why I'm on the jet

  I pull up with like fifteen black trucks I feel like the president
  Two hundred and fifty thousand yeah that's how my day was spent
  I stuff that shit in my trousers yeah-yeah-yeah they Givenchy

  I'm tryna switch up my location switch my residence
  I just bust my wrist down then I go bust down my bitch
  Huh I'm gettin' rich now I ain't got time for that shit
  I keep pourin' up drank and the way I'm gettin' sick
  I'm with the X-Man bitch we like the presidents

  Huh huh everything I do presidential like the Rollie
  VETEMENTS New Rock boots I got on like "Holy moly"
  I unfold that Kel-Tec and let that bitch fold it
  I live in a hotel live my life like Zack and Cody
  But all these niggas be hatin' like Mr. Moseby
  I told you that I ain't got no racks I was gon' do the most
  I'm way ahead of these niggas man that shit ain't even close
  I can stop the whole world yeah with one post

  I pull up with like fifteen black trucks I feel like the president
  Two hundred and fifty thousand that's how my day was spent
  I stuff that shit in my trousers yeah they Givenchy

  I stuff them racks in the drawers yeah-yeah in my britches`;
const colorOptions = ["white"];
const sizeRange = { min: 70, max: 150 };

const styledText = prepareTextData(inputString, colorOptions, sizeRange);
// write the array to file.json
fs.writeFileSync("public/lyrics.json", JSON.stringify(styledText, null, 2));
