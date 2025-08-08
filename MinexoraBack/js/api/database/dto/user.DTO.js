class UserDTO {
  constructor(name, lastName, documentType, documentNumber, mail, username, password, rol, telephone,token) {
    this.name = name;
    this.lastName = lastName;
    this.documentType = documentType;
    this.documentNumber = documentNumber;
    this.mail = mail;
    this.username = username;
    this.password = password;
    this.rol = rol;
    this.telephoneNumber = telephone;
    this.token = token;
  }
}

module.exports = UserDTO;