import { IMarriage, IPerson } from "@/lib/models";
import { calculateAge, COLORS, formatLifeSpan, formatPartialDate } from "@/lib/utils";
import { Handle, NodeProps, Position } from "react-flow-renderer";

const WIDTH = 155;
const FONTSIZE = 9;
const BORDERWIDTH = 2;

export function PersonNode({ data }: NodeProps<{ person: IPerson }>) {
    const age = calculateAge(data.person.dob, data.person.deathDate);
    return (
        <div
            style={{
                border: `${BORDERWIDTH}px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: 8,
                whiteSpace: "pre-line",
                background: data.person.gender === "female" ? COLORS.female : data.person.gender === "male" ? COLORS.male : COLORS.other,
                color: COLORS.text,
                fontSize: FONTSIZE,
                fontWeight: 600,
                width: WIDTH,
                textAlign: "center",
            }}
        >
            <Handle type="target" position={Position.Top} />

            <p>{data.person.name} {age ? `(${age})` : ''}</p>
            <p>{formatLifeSpan(data.person.dob, data.person.deathDate)}</p>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export function MarriedPersonNode({ data }: NodeProps<{ spouses: IPerson[], marriage: IMarriage }>) {
    const bloodSpouse = data.spouses[0]
    const otherSpouse = data.spouses[1]

    const baseColor =
        bloodSpouse?.gender === "male"
            ? COLORS.male
            : bloodSpouse?.gender === "female"
                ? COLORS.female
                : COLORS.other

    const bloodSpouseAge = calculateAge(bloodSpouse.dob, bloodSpouse.deathDate);
    const otherSpouseAge = calculateAge(otherSpouse.dob, otherSpouse.deathDate);

    return (
        <div
            style={{
                width: WIDTH,
                border: `${BORDERWIDTH}px solid ${COLORS.border}`,
                whiteSpace: "pre-line",
                background: baseColor,
                textAlign: "center",
                borderRadius: 10,
                padding: 8,
                fontSize: FONTSIZE - 1,
                color: COLORS.text,
                fontWeight: 600,
            }}
        >
            <Handle type="target" position={Position.Top} />

            <p>{bloodSpouse.name} {bloodSpouseAge ? `(${bloodSpouseAge})` : ''}</p>
            <p>{formatLifeSpan(bloodSpouse.dob, bloodSpouse.deathDate)}</p>
            <p>{otherSpouse.name} {otherSpouseAge ? `(${otherSpouseAge})` : ''}</p>
            <p>{formatLifeSpan(otherSpouse.dob, otherSpouse.deathDate)}</p>

            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}


export function MarriageNode({ data }: NodeProps<{ marriage: IMarriage }>) {
    const age = calculateAge(data.marriage.date, {})
    return (
        <div
            style={{
                width: WIDTH,
                borderRadius: 8,
                border: `${BORDERWIDTH}px solid ${COLORS.border}`,
                background: COLORS.marriage,
                color: COLORS.text,
                textAlign: "center",
                whiteSpace: "pre-line",
                padding: 6,
                fontSize: FONTSIZE,
                fontWeight: 600,
            }}
        >
            <Handle type="target" position={Position.Top} />
            💍 {formatPartialDate(data.marriage.date)} {age ? `(${age})` : ''}
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export const nodeTypes = {
    person: PersonNode,
    marriage: MarriageNode,
    marriedPerson: MarriedPersonNode,
};
