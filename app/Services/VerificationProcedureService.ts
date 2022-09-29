import VerificationProcedure from 'App/Models/VerificationProcedure'

interface VerificationProcedurePayload {
  id: string;
  userId: string;
  type: string;
}

function create (payload: VerificationProcedurePayload) {
  const verificationProcedure = new VerificationProcedure()
  verificationProcedure.id = payload.id
  verificationProcedure.userId = payload.userId
  verificationProcedure.type = payload.type
  return verificationProcedure.save()
}

function findById (id: string): Promise<VerificationProcedure> {
  return VerificationProcedure.findOrFail(id)
}

async function deleteById (id: string) {
  (await findById(id)).delete()
}

export default { create, findById, deleteById }
