import { getImageUrl } from './utils.js'

export default function Avatar({person, size = 80}) {
    return (
        <img
            className="avatar"
            src={getImageUrl(person)}
            alt={person.name}
            width={size}
            height={size}
        />
    );
}