import "./Home.css";

function Home(){

return(

<div className="home-container">

<div className="header">

<h2>
Hello 🌸
</h2>

<p>
Week 18 Pregnancy
</p>

</div>


<div className="home-card">

<h3>
Today's Care Plan
</h3>

<p>☐ Drink Water</p>

<p>☐ Take Medicine</p>

<p>☐ Rest Properly</p>

</div>


<div className="home-card">

<h3>
Ask Maia
</h3>

<input
placeholder="Type here..."
/>

<button>

Send

</button>

</div>


<div className="home-card emergency">

<h3>

🚨 Emergency Help

</h3>

<p>
Severe Pain
</p>

<p>
Bleeding
</p>

<button>

Send Alert

</button>

</div>

</div>

)

}

export default Home;