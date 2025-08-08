class UserMapper {
  static toEntity(dto) {
    return {
      name: dto.name,
      last_name: dto.lastName,
      document_type: dto.documentType,
      document_number: dto.documentNumber,
      mail: dto.mail,
      username: dto.username,
      password: dto.password,
      rol: dto.rol,
      telephone_number: dto.telephoneNumber,
      token : dto.token
    };
  }
}

module.exports = { UserMapper };