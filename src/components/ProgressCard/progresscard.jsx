import "./ProgressCard.css";

function ProgressCard({ week }) {

    const progress = (week / 40) * 100;

    return (

        <div className="progress-card">

            <h3>
                Pregnancy Progress
            </h3>

            <h2>
                Week {week} / 40
            </h2>

            <div className="progress-bar">

                <div
                    className="progress-fill"
                    style={{
                        width: `${progress}%`
                    }}
                />

            </div>

            <p>

                {Math.round(progress)}% Completed

            </p>

        </div>

    );

}

export default ProgressCard;