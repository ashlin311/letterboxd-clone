import LoginSignup from './components/LoginSignup/LoginSignup';
import MovieDetails from './components/MovieDetails/movieDetails';  
import './App.css';

function App() {
  return (
    <div >
      { // <LoginSignup/> 
      }
      <MovieDetails movieId={19} />
    </div>
  );
}

export default App;
