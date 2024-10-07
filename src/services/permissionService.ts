import { IPermissionRepository } from "../repository/interfaces/Ipermission.repository";
import { User } from "../entities/User";
import { Logger } from "../logging/logger"; // Import Logger

export class PermissionsService {
  private permissionRepository: IPermissionRepository;
  private logger: Logger; // Add logger

  constructor(permissionRepository: IPermissionRepository, logger: Logger) {
    this.permissionRepository = permissionRepository;
    this.logger = logger;
  }

  async shareDocumentWithUser(
    documentId: string,
    email: string,
    permissionType: string
  ): Promise<string> {
    this.logger.log(`Sharing document: ${documentId} with ${email}`);

    // Fetch the user using their email
    const targetUser: User | null =
      await this.permissionRepository.findUserByEmail(email);

    if (!targetUser) {
      this.logger.error(`User with email: ${email} not found.`);
      throw new Error("User with this email does not exist.");
    }

    // Check if the permission exists (this will be based on the user id)
    const permissionExists = await this.permissionRepository.findUserByEmail(
      targetUser.getId()
    );

    // Share the permission if it does not exist, otherwise update it
    if (!permissionExists) {
      this.logger.log(
        `No existing permission found. Sharing document ${documentId} with ${email}`
      );
      await this.permissionRepository.sharePermission(
        documentId,
        targetUser.getId(),
        permissionType
      );
    } else {
      this.logger.log(
        `Permission already exists. Updating permission for document ${documentId} and user ${email}`
      );
      await this.permissionRepository.updatePermission(
        documentId,
        targetUser.getId(),
        permissionType
      );
    }

    return `Document shared as ${permissionType} with ${email}`;
  }
}
