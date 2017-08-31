/**
 * Project janux-persistence
 * Created by ernesto on 6/9/17.
 */

/**
 * This interface defines the content of a validation error.
 */
export interface ValidationError {
	attribute: string;
	message: string;
	value: string;
}
