
// Self-contained button with onClick handler
function AlertButton({message, children}) {
    return (
      <button onClick={() => {alert(message)}}>
          {children}
      </button>
    );
}

// Buttons where onClick handler is passed from the parent
function Button({onClick, children}) {
    return (
      <button onClick={ e => {
          e.stopPropagation();  // to prevent passing this event above - to the parent component (like <div>).
          e.preventDefault(); // prevents the default browser behavior for the few events that have it (like page reload after form is submitted).
          onClick();
      }}>
          {children}
      </button>
    );
}

function PlayButton({movieName}) {
    function handlePlayOnClick() {
        alert(`Playing ${movieName}!`)
    }
    return (
      <Button onClick={handlePlayOnClick}>
          Play "{movieName}"
      </Button>
    );
}

function UploadButton() {
    return (
      <Button onClick={() => alert("Upload!")}>
          Upload!
      </Button>
    );
}

export default function ToolBar() {
    return (
      <div>
          <PlayButton movieName="Borat" />
          <UploadButton />
      </div>
    );
}