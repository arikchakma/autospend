#let yearly-summary(
  year,
  user,
  items,
) = {
  set text(lang: "en", region: "US")
  set page(paper: "a4", margin: (x: 20%, y: 20%, top: 20%, bottom: 20%))
  set text(number-type: "old-style")

  let format_currency(number, locale: "en") = {
    let precision = 2
    let s = str(calc.round(number, digits: precision))
    let after_dot = s.find(regex("\..*"))
    if after_dot == none {
      s = s + "."
      after_dot = "."
    }
    for i in range(precision - after_dot.len() + 1){
      s = s + "0"
    }
    if locale == "en" { s.replace(".", ".") } else { s }
  }

  smallcaps[
    *#user.name* •
    #user.email •
    #user.city #user.country
  ]

  v(1em)

  [
    #set par(leading: 0.40em)
    #set text(size: 1.2em)

    Financial Summary for \
    Personal Yearly Summary
  ]

  v(2em)

  grid(
    columns: (1fr, 1fr),
    align: bottom,
    heading[
      Yearly Summary \##year
    ],
    [
      #set align(right)
      #user.city, *#datetime.today().display("[day].[month].[year]")*
    ]
  )

  let items_formatted = items.enumerate().map(
      ((index, item)) => (
        [#str(index + 1).],
        [#item.name],
        [BDT #format_currency(item.total)],
      )
    ).flatten()

  [
    #set text(number-type: "lining")
    #table(
      stroke: none,
      columns: (auto, 10fr, auto),
      align: ((column, row) => if (column == 0 or column == 1) { left } else { right }),
      table.hline(stroke: (thickness: 0.5pt)),
      [*Pos.*], [*Category*], [*Amount*],
      table.hline(),
      ..items_formatted,
      table.hline(),
      [],
      [
        #set align(end)
        Total:
      ],
      [
        *BDT #format_currency(items.map(i => i.total).sum())*
      ],
      table.hline(start: 2),
    )
  ]

  v(1em)

  [
    #set text(size: 1em)
    
    We hope you find this summary helpful. If you have any questions, please feel free to contact us. We're always here to help you.

    *Note:* This summary is generated automatically by AutoSpend. It is not a financial advice. Please consult a financial advisor for your financial decisions.
  ]

  v(1em)

  [
    Best Regards,\
    Team AutoSpend
  ]
}


#show: yearly-summary(
  2025,
  (name: "Arik Chakma", email: "arikchangma@gmail.com", city: "Dhaka", country: "Bangladesh"),
  (
    (name: "Food", total: 1000),
    (name: "Transport", total: 2000),
    (name: "Shopping", total: 3000),
    (name: "Entertainment", total: 4000),
    (name: "Accommodation", total: 5000),
    (name: "Health", total: 6000),
    (name: "Education", total: 7000),
    (name: "Bills", total: 8000),
    (name: "Other", total: 9000),
  ),
)