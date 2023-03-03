const postcss = require("postcss")

const plugin = require("./")

const tokens = {
  font: "Helvetica",
  color: {
    deeppink: "#ff1493",
  },
  breakpoint: {
    desktop: "64em",
  },
  width: "768px",
}

async function run(input, output, warnings = 0, opts = { tokens }) {
  let result = await postcss([plugin(opts)]).process(input, {
    from: undefined,
  })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(warnings)
}

describe("* declarations", () => {
  describe("retrieves value", () => {
    it("without quotes", async () => {
      await run(`a { font: token(font); }`, `a { font: Helvetica; }`)
    })
    it('with " quotes', async () => {
      await run(`a { font: token("font"); }`, `a { font: Helvetica; }`)
    })
    it("with ' quotes", async () => {
      await run(`a { font: token('font'); }`, `a { font: Helvetica; }`)
    })
  })
  describe("retrieves nested value", () => {
    it("without quotes", async () => {
      await run(`a { color: token(color.deeppink); }`, `a { color: #ff1493; }`)
    })
    it(`with " quotes`, async () => {
      await run(
        `a { color: token("color.deeppink"); }`,
        `a { color: #ff1493; }`
      )
    })
    it(`with ' quotes`, async () => {
      await run(
        `a { color: token('color.deeppink'); }`,
        `a { color: #ff1493; }`
      )
    })
  })
  it("does not interfere with other functions or values", async () => {
    await run(
      `a { color: color(deeppink); line-height: 1.5; }`,
      `a { color: color(deeppink); line-height: 1.5; }`
    )
  })
  it("only substitutes the first function arg", async () => {
    await run(
      `a { font: token(font, color.deeppink); }`,
      `a { font: Helvetica; }`
    )
  })
  it("empty declaration", async () => {
    await run(`a { font: ; }`, `a { font: ; }`)
  })
  describe("warning", () => {
    it("on missing tokens option", async () => {
      await run(
        `a { font-size: token(font); }`,
        `a { font-size: token(font); }`,
        2,
        {}
      )
    })
    it("on missing token", async () => {
      await run(`a { font: token(null); }`, `a { font: token(null); }`, 1)
    })
    it("on incorrect token", async () => {
      await run(`a { font: token(); }`, `a { font: token(); }`, 1)
    })
  })
})

describe("@media atrule", () => {
  describe("retrieves value", () => {
    it("without quotes", async () => {
      await run(
        `@media (max-width: token(width)) {}`,
        `@media (max-width: 768px) {}`
      )
    })
    it(`with " quotes`, async () => {
      await run(
        `@media (max-width: token("width")) {}`,
        `@media (max-width: 768px) {}`
      )
    })
    it(`with ' quotes`, async () => {
      await run(
        `@media (max-width: token('width')) {}`,
        `@media (max-width: 768px) {}`
      )
    })
  })
  describe("retrieves nested value", () => {
    it("without quotes", async () => {
      await run(
        `@media (max-width: token(breakpoint.desktop)) {}`,
        `@media (max-width: 64em) {}`
      )
    })
    it(`with " quotes`, async () => {
      await run(
        `@media (max-width: token("breakpoint.desktop")) {}`,
        `@media (max-width: 64em) {}`
      )
    })
    it(`with ' quotes`, async () => {
      await run(
        `@media (max-width: token('breakpoint.desktop')) {}`,
        `@media (max-width: 64em) {}`
      )
    })
  })
  it("does not interfere with other functions or values", async () => {
    await run(
      "@media (max-width: color(#fff)) {} @media (max-width: 75rem) {}",
      "@media (max-width: color(#fff)) {} @media (max-width: 75rem) {}"
    )
  })
  it("only substitutes the first function arg", async () => {
    await run(
      `@media (max-width: token(width, breakpoint.desktop)) {}`,
      `@media (max-width: 768px) {}`
    )
  })
  describe("warning", () => {
    it("on missing tokens option", async () => {
      await run(
        `@media (max-width: token(width)) {}`,
        `@media (max-width: token(width)) {}`,
        2,
        {}
      )
    })
    it("on missing token", async () => {
      await run(
        `@media (max-width: token(null)) {}`,
        `@media (max-width: token(null)) {}`,
        1
      )
    })
    it("on incorrect token", async () => {
      await run(
        `@media (max-width: token()) {}`,
        `@media (max-width: token()) {}`,
        1
      )
    })
  })
})

describe("@custom-media atrule", () => {
  describe("retrieves value", () => {
    it("without quotes", async () => {
      await run(
        `@custom-media --mobile (max-width: token(width));`,
        `@custom-media --mobile (max-width: 768px);`
      )
    })
    it(`with " quotes`, async () => {
      await run(
        `@custom-media --mobile (max-width: token("width"));`,
        `@custom-media --mobile (max-width: 768px);`
      )
    })
    it(`with ' quotes`, async () => {
      await run(
        `@custom-media --mobile (max-width: token('width'));`,
        `@custom-media --mobile (max-width: 768px);`
      )
    })
  })
  describe("retrieves nested value", () => {
    it("without quotes", async () => {
      await run(
        `@custom-media --desktop (min-width: token(breakpoint.desktop));`,
        `@custom-media --desktop (min-width: 64em);`
      )
    })
    it(`with " quotes`, async () => {
      await run(
        `@custom-media --desktop (min-width: token("breakpoint.desktop"));`,
        `@custom-media --desktop (min-width: 64em);`
      )
    })
    it(`with ' quotes`, async () => {
      await run(
        `@custom-media --desktop (min-width: token('breakpoint.desktop'));`,
        `@custom-media --desktop (min-width: 64em);`
      )
    })
  })
  it("does not interfere with other functions or values", async () => {
    await run(
      `@custom-media --other (max-width: color(#fff)); @custom-media --another (max-width: 1200px);`,
      `@custom-media --other (max-width: color(#fff)); @custom-media --another (max-width: 1200px);`
    )
  })
  it("only substitutes the first function arg", async () => {
    await run(
      `@custom-media --desktop (min-width: token(breakpoint.desktop, width));`,
      `@custom-media --desktop (min-width: 64em);`
    )
  })
  describe("warning", () => {
    it("on missing tokens option", async () => {
      await run(
        `@custom-media --mobile (max-width: token(width));`,
        `@custom-media --mobile (max-width: token(width));`,
        2,
        {}
      )
    })
    it("on missing token", async () => {
      await run(
        `@custom-media --mobile (max-width: token(null));`,
        `@custom-media --mobile (max-width: token(null));`,
        1
      )
    })
    it("on incorrect token", async () => {
      await run(
        `@custom-media --mobile (max-width: token());`,
        `@custom-media --mobile (max-width: token());`,
        1
      )
    })
  })
})

describe("@container atrule", () => {
  describe("retrieves value", () => {
    it("without quotes", async () => {
      await run(
        `@container (max-width: token(width)) {}`,
        `@container (max-width: 768px) {}`
      )
    })
    it(`with " quotes`, async () => {
      await run(
        `@container (max-width: token("width")) {}`,
        `@container (max-width: 768px) {}`
      )
    })
    it(`with ' quotes`, async () => {
      await run(
        `@container (max-width: token('width')) {}`,
        `@container (max-width: 768px) {}`
      )
    })
  })
  describe("retrieves nested value", () => {
    it("without quotes", async () => {
      await run(
        `@container (max-width: token(breakpoint.desktop)) {}`,
        `@container (max-width: 64em) {}`
      )
    })
    it(`with " quotes`, async () => {
      await run(
        `@container (max-width: token("breakpoint.desktop")) {}`,
        `@container (max-width: 64em) {}`
      )
    })
    it(`with ' quotes`, async () => {
      await run(
        `@container (max-width: token('breakpoint.desktop')) {}`,
        `@container (max-width: 64em) {}`
      )
    })
  })
  it("does not interfere with other functions or values", async () => {
    await run(
      "@container (max-width: color(#fff)) {} @container (max-width: 75rem) {}",
      "@container (max-width: color(#fff)) {} @container (max-width: 75rem) {}"
    )
  })
  it("only substitutes the first function arg", async () => {
    await run(
      `@container (max-width: token(width, breakpoint.desktop)) {}`,
      `@container (max-width: 768px) {}`
    )
  })
  describe("warning", () => {
    it("on missing tokens option", async () => {
      await run(
        `@container (max-width: token(width)) {}`,
        `@container (max-width: token(width)) {}`,
        2,
        {}
      )
    })
    it("on missing token", async () => {
      await run(
        `@container (max-width: token(null)) {}`,
        `@container (max-width: token(null)) {}`,
        1
      )
    })
    it("on incorrect token", async () => {
      await run(
        `@container (max-width: token()) {}`,
        `@container (max-width: token()) {}`,
        1
      )
    })
  })
})
