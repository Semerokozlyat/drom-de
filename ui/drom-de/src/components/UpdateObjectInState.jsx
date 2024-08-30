import { useState } from 'react';
// import { useImmer } from 'use-immer';  - Immer is the package for mutating objects in state with simple syntax

export default function MovingDotAfterCursor() {
    const [position, setPosition] = useState({x: 0, y: 0});  // Object in state must always be replaced, not updated!

    // Here is the example how to use Imme with useImmer instead of useState.
    //
    // const [person, updatePerson] = useImmer({
    //     name: 'Niki de Saint Phalle',
    //     artwork: {
    //         title: 'Blue Nana',
    //         city: 'Hamburg',
    //         image: 'https://i.imgur.com/Sd1AgUOm.jpg',
    //     }
    // });

    // function handleNameChange(e) {
    //     updatePerson(draft => {
    //         draft.name = e.target.value;
    //     });
    // }

    return (
        <div
            onPointerMove={e => {
                setPosition({x: e.clientX, y: e.clientY});
            }}
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
            }}>
            <div style={{
                position: 'absolute',
                backgroundColor: 'red',
                borderRadius: '50%',
                transform: `translate(${position.x}px, ${position.y}px)`,
                left: -10,
                top: -10,
                width: 20,
                height: 20,
            }}/>
        </div>
    );
}

export function Form() {
    const [person, setPerson] = useState({
        firstName: "OneName",
        lastName: "OneSurname",
        email: "one@test.com",
        address: {              // this object is nested, should be updated too
            city: "Munich",
            postalCode: 85622
        }
    });

    function handleFirstNameChange(e) {
        setPerson({
            ...person,  // it is called "spread syntax", means copy all fields from the old to this new object
            firstName: e.target.value  // and override only firstName field
        });
    }

    function handleLastNameChange(e) {
        setPerson({
            ...person,
            lastName: e.target.value
        });
    }

    function handleEmailChange(e) {
        setPerson({
            ...person,
            email: e.target.value
        });
    }

    function handlePostalCodeChange(e) {
        setPerson({
            ...person,
            address: {
                ...person.address,          // to update nested object, we need to copy it too
                postalCode: e.target.value  // and update only required field
            }
        });
    }

    return (
        <>
            <label>
                First name:
                <input
                    value={person.firstName}
                    onChange={handleFirstNameChange}
                />
            </label>
            <label>
                Last name:
                <input
                    value={person.lastName}
                    onChange={handleLastNameChange}
                />
            </label>
            <label>
                Email:
                <input
                    value={person.email}
                    onChange={handleEmailChange}
                />
            </label>
            <label>
                PostalCode:
                <input
                    value={person.address.postalCode}
                    onChange={handlePostalCodeChange}
                />
            </label>
            <p>
                {person.firstName}{' '}
                {person.lastName}{' '}
                ({person.email}) {"     "}
                {person.address.city}
                {person.address.postalCode}
            </p>
        </>
    );
}