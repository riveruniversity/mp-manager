import { GROUP_IDS } from "../services/mp/const";

export function getAgeGroupId(dateOfBirth: string ) {
	const age = calculateAge(dateOfBirth!);
	if (age.years >= 1 && age.years <= 2) return GROUP_IDS.RIVER_NURSERY;
	else if (age.years >= 3 && age.years <= 5) return GROUP_IDS.RIVER_BEARS;
	else if (age.years >= 6 && age.years <= 12) return GROUP_IDS.RIVER_KIDS;
	else if (age.years >= 13 && age.years <= 17) return GROUP_IDS.MINOR_WAIVER;
}

export function calculateAge(birthDate: string | Date) {
	birthDate = new Date(birthDate);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}

	const months = monthDiff < 0 ? 12 + monthDiff : monthDiff;
	const days = today.getDate() - birthDate.getDate();

	return {
		years: age,
		months: months,
		days: days < 0 ? 30 + days : days
	};
}