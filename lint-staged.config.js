module.exports = {
  '{apps,packages,tools}/**/*.{ts,tsx}': files => {
    return `nx affected --target=typecheck --files=${files.join(',')}`;
  },
  '{apps,packages,tools}/**/*.{js,ts,jsx,tsx,json}': [
    files => `nx affected:lint --files=${files.join(',')}`,
    files => `nx format:write --files=${files.join(',')}`,
  ],
  };
