const cron = require("node-cron");
const db = require("../db");
const sendReminderEmail = require("./emailService");

function scheduleTaskReminders() {
  cron.schedule("* * * * *", async () => {
    try {
      console.log("\n⏳ Checking tasks at:", new Date().toISOString());

      // Debug: show current database time
      const dbTimeRes = await db.query("SELECT NOW()");
      console.log("🗄️ DB Time:", dbTimeRes.rows[0].now.toISOString());

      // Log all tasks to verify due_date and reminded status
      const allTasks = await db.query("SELECT id, title, due_date, reminded, user_email FROM tasks ORDER BY due_date ASC");
      console.log("📋 All tasks:");
      allTasks.rows.forEach(task => {
        console.log(`   🔹 ${task.title} | Due: ${task.due_date} | Email: ${task.user_email} | Reminded: ${task.reminded}`);
      });

      // ✅ Check for tasks due in the next hour
      const result = await db.query(`
        SELECT * FROM tasks
        WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '1 hour'
        AND reminded = false
      `);

      console.log(`🔍 Found ${result.rows.length} task(s) due in the next hour`);

      for (const task of result.rows) {
        if (!task.user_email) {
          console.warn(`⚠️ Skipping task ID ${task.id} - Missing user_email`);
          continue;
        }

        const subject = "⏰ Task Reminder";
        const message = `
          Hello!

          This is a reminder that your task "${task.title}" is due at ${task.due_date}.

          Please make sure to complete it on time.
          
          - Task Scheduler App
        `;

        try {
          await sendReminderEmail(task.user_email, subject, message);
          console.log(`✅ Email sent to ${task.user_email} for task "${task.title}"`);

          // Mark task as reminded
          await db.query("UPDATE tasks SET reminded = true WHERE id = $1", [task.id]);
          console.log(`📌 Task ID ${task.id} marked as reminded`);
        } catch (emailError) {
          console.error(`❌ Email failed to ${task.user_email}:`, emailError.message);
        }
      }
    } catch (err) {
      console.error("❌ Scheduler error:", err.message);
    }
  });
}

module.exports = scheduleTaskReminders;
