export const estateResponseDto = (estate) => ({
  id: estate._id,

  estateCode: estate.estateCode,

  name: estate.name,

  district: estate.district,

  area: estate.area,

  established: estate.established,

  manager: estate.manager
    ? {
        id: estate.manager._id,
        name: estate.manager.name,
      }
    : null,

  phoneNumber: estate.phoneNumber,

  coverImage: estate.coverImage,

  status: estate.status,
});
