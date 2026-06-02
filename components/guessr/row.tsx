import { GuessrAnswer } from "@/scripts/game_mgr/types";
import { useEffect, useState } from "react";
import { BsArrowDown } from "react-icons/bs";

export function GuessrRow(props: GuessrAnswer) {
    const match = props.distanceWithAnswer === 0;
    const [animation, setAnimation] = useState([
        `animate-flash-${props.validLinesOnStation.length > 0 ? "green" : "red"}`,
        `animate-flash-${props.cityMatch.length > 0 ? "green" : "red"}`,
        `animate-flash-${match ? "green" : "red"}`,
    ]);

    useEffect(() => {
        const timer = setTimeout(() => setAnimation(["", "", ""]), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <tr className="border-b [&>td]:p-3 font-semibold">
            <td>
                <p className="text-base mb-1 text-dyn-md">
                    {props.guess.name}
                </p>
            </td>
            <td className={animation[0]}>
                <div className="flex flex-wrap gap-1 justify-center">
                    {props.validLinesOnStation.length > 0 ?
                        props.validLinesOnStation.sort().map((c) => (
                            <img
                                key={`${props.guess.id}-valid-${c}`}
                                className="img-w-dyn"
                                src={`/lines/${c}.svg`}
                                alt={`Ligne ${c}`}
                            />
                        )) :
                        <p>Aucune</p>
                    }
                </div>
            </td>
            <td className={`p-2 text-center text-dyn-md ${animation[1]} ${
                props.cityMatch.length > 0 ? "text-success-content" : "text-error-content"
            }`}>
                <div className="flex flex-wrap gap-1 justify-center">
                    {props.cityMatch.length > 0 ?
                        props.cityMatch.sort().map((c) => (
                            <p key={`${props.guess.id}-valid-${c}`}>
                                {c}
                            </p>
                        )) :
                        <p>Incorrecte</p>
                    }
                </div>
            </td>
            <td className={`${animation[2]} ${
                match ? "text-success-content" : "text-error-content"
            }`}>
                <div className="flex items-center justify-end gap-1.5">
                    <span className="text-dyn-md whitespace-nowrap">
                        {props.distanceWithAnswer === 0 ? "Exact" : `${
                            props.distanceWithAnswer
                                .toFixed(2)
                                .replace(".", ",")
                        } km`}
                    </span>
                    {props.distanceWithAnswer > 0 && (
                        <BsArrowDown
                            style={{
                                rotate: `${
                                    props.cardinalDirectionTowardsAnswer
                                }deg`
                            }}
                            size={14}
                        />
                    )}
                </div>
            </td>
        </tr>
    );
}
