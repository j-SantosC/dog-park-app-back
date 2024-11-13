const removeExpiredDogs = async () => {
	const now = Date.now();
	const expirationTime = 2 * 60 * 1000; // 5 minutos en milisegundos

	try {
		const parksRef = admin.database().ref('dogParks');
		const parksSnapshot = await parksRef.once('value');

		// Recorrer cada parque
		parksSnapshot.forEach((parkSnapshot) => {
			const parkId = parkSnapshot.key;
			const dogsRef = parksRef.child(`${parkId}/dogs`);

			// Recorrer cada perro en el parque
			dogsRef.once('value', (dogsSnapshot) => {
				dogsSnapshot.forEach((dogSnapshot) => {
					const dogId = dogSnapshot.key;
					const dogData = dogSnapshot.val();

					// Verificar si el perro ha estado más de 5 minutos en el parque
					if (
						dogData.addedAt &&
						now - dogData.addedAt >
							expirationTime
					) {
						dogsRef.child(dogId).remove(); // Eliminar el perro si ha expirado su tiempo
					}
				});
			});
		});

		console.log('Expired dogs removed successfully.');
	} catch (error) {
		console.error('Error removing expired dogs:', error);
	}
};

module.exports = { removeExpiredDogs };
