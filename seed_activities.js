const axios = require('axios');
const base = 'http://localhost:5050/api/activities';
const acts = Array.from({length:20},(_,i)=>({
  title:`Activity ${i+1}`,
  description:`Description for activity ${i+1}`,
  category:['wellness','sports','music','art','tech'][i%5],
  date:new Date(Date.now()+i*86400000).toISOString(),
  slots:10+i,
  imageUrl: `https://source.unsplash.com/featured/400x200?${['wellness','sports','music','art','tech'][i%5]},event,activity`
}));
(async()=>{
  for(const a of acts){
    try {
      const r = await axios.post(base,a);
      console.log('Added:', r.data.title);
    } catch(e) {
      console.error(e.response?.data||e.message);
    }
  }
})(); 