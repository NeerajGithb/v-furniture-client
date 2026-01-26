import bcrypt from "bcrypt";
import slugify from "slugify";
import User from "@/models/User";

/**
 * User Business Logic Service
 * Extracted from User model
 */

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  inputPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(inputPassword, hashedPassword);
}

export async function generateUniqueSlug(name: string): Promise<string> {
  let baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;

  while (await User.findOne({ slug })) {
    slug = `${baseSlug}-${i++}`;
  }

  return slug;
}

export async function prepareUserForSave(user: any): Promise<void> {
  // Hash password if modified
  if (user.isModified("password") && user.password) {
    user.password = await hashPassword(user.password);
  }

  // Generate slug if needed
  if (!user.slug || user.isModified("name")) {
    user.slug = await generateUniqueSlug(user.name);
  }
}