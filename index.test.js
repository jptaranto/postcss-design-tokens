const postcss = require("postcss")

const plugin = require("./")

async function run(input, output, opts = {}, warnings = 0) {
  let result = await postcss([plugin(opts)]).process(input, {
    from: undefined,
  })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(warnings)
}

it("substitutes value", async () => {
  const tokens = {
    issa: "#fff",
  }
  await run("a { font-size: token(issa); }", "a { font-size: #fff; }", {
    tokens,
  })
})

it("substitutes nested values", async () => {
  const tokens = {
    issa: {
      bagayogo: {
        timbuktu: "#fff",
      },
    },
  }
  await run(
    "a { font-size: token(issa.bagayogo.timbuktu); }",
    "a { font-size: #fff; }",
    { tokens }
  )
})

it("wont substitute other functions or values", async () => {
  const tokens = {
    issa: "#fff",
  }
  await run(
    "a { font-size: token(issa); color: color(bagayogo); line-height: 1.5; }",
    "a { font-size: #fff; color: color(bagayogo); line-height: 1.5; }",
    { tokens }
  )
})

it("only substitutes the first function arg", async () => {
  const tokens = {
    issa: "#fff",
  }
  await run(
    "a { font-size: token(issa, bagayogo); }",
    "a { font-size: #fff; }",
    { tokens }
  )
})

describe("warning", () => {
  it("on missing tokens option", async () => {
    await run(
      "a { font-size: token(issa); }",
      "a { font-size: token(issa); }",
      {},
      2
    )
  })

  it("on missing token", async () => {
    const tokens = {
      issa: "#fff",
    }
    await run(
      "a { font-size: token(issa); color: token(bagayogo); }",
      "a { font-size: #fff; color: token(bagayogo); }",
      { tokens },
      1
    )
  })

  it("on incorrect token", async () => {
    const tokens = {
      issa: "#fff",
    }
    await run(
      "a { font-size: token(issa); color: token(); }",
      "a { font-size: #fff; color: token(); }",
      { tokens },
      1
    )
  })
})
