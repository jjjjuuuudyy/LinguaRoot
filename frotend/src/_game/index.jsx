import Game_Start from "../../components/_game/game_start";
import "../../static/css/_game/index.css"
import { useAuth } from "../userServives/authContext";
import PermissionProtect from "../userServives/permissionProtect"
import FlowerImg from "../../static/assets/flower.png"

const App = ({ }) => {

    const { userData } = useAuth();

    return (
        <div className="background">
            <h1 className="game-title">Tninun TAYAL - 編織泰雅</h1>

            {userData == null ?
                (<PermissionProtect />) :
                (
                    <div className="game-background">
                        <Game_Start />
                    </div>
                )
            }
        </div>
    );
};

export default App;