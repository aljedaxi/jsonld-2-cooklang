import process from 'node:process'
import YAML from 'yaml'

const processStdin = async () => {
  const inputs = [];
  for await (const chunk of process.stdin) {
    const recipe = JSON.parse(chunk);
    if (!recipe["@type"].includes("Recipe")) throw(recipe)
    if (!recipe["@context"] === 'http://schema.org') throw(recipe)
    inputs.push(new Recipe(recipe));
  }
  return inputs;
};
const isBlank = s => typeof s === 'string' && s.trim().length > 0
const notBlank = s => !isBlank(s)
class Recipe {
  constructor(input) {
    const {
      name,
      author,
      description,
      image,
      recipeCuisine,
      recipeYield,
      prepTime,
      cookTime,
			totalTime,
			recipeIngredient,
			recipeInstructions,
      url,
    } = input;
    this.steps = recipeInstructions.map(({text}) => text)
    this.ingredients = recipeIngredient ?? []
    this.metaData = {
      'source.url': url, 
      'source.author': author.name,
      yield: recipeYield,
      locale: 'en_CA',
      time: totalTime,
      'time.prep': prepTime,
      'time.cook': cookTime,
      cuisine: recipeCuisine,
      image: image?.[0],
      title: name,
      description,
    }
  }
  formatMeta = () => [...Object.entries(this.metaData)].map(([k, v]) => `>> ${k}: ${v}`).join('\n')
  formatIngredientsSection = () => 
    this.ingredients.length === 0 ? ''
      : `-- Ingredients:\n${this.ingredients.map(s => `-- ${s}`).join('\n')}`
  formatSteps = () => this.steps.join('\n\n')
  format() {
    return [this.formatMeta(), this.formatIngredientsSection(), '\n', this.formatSteps()].join('\n')
  }
}
const main = xs => xs.map(x => x.format())
process.stdin.setEncoding("utf-8");
processStdin().then(xs => main(xs).forEach(x => console.log(x))).catch(console.error)
