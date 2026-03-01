import cron from "node-cron"

cron.schedule("0 20 * * 0", async () => {
  console.log("Running weekly scheduler...")

  await fetch("http://localhost:3000/api/schedule/run", {
    method: "POST"
  })
})