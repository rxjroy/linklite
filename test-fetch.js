fetch('http://localhost:4000/KnRVqn', { redirect: 'manual' })
  .then(async res => {
    console.log("Status:", res.status);
    console.log("Location:", res.headers.get('location'));
    console.log("Body:", await res.text());
  })
  .catch(console.error);
