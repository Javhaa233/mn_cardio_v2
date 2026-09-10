async function run() {
  const req = await fetch(
    "http://localhost:3000/BaseObject/GetCustomFormData",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ObjectName: "DoctorsTeam", Module: "none" }),
    },
  );
  if (req.ok) {
    const data = await req.json();
    console.log(data);
  } else {
    console.log(req.status, await req.text());
  }
}
run();
