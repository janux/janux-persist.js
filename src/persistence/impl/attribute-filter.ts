/*
 * Project janux-persistence
 * Created by ernesto on 6/15/17.
 */

/**
 * This class helps the make criteria filters.
 */
export class AttributeFilter {
    public attributeName: string;
    public value: any;

    constructor(attributeName: string, value: any) {
        this.attributeName = attributeName;
        this.value = value;
    }
}
