'use strict';

/**
 * @class Enum
 * @author Daniel Jiménez
 */
class Enum {
	/**
	 * class constructor
	 */
	constructor() {
		this._enums = {};
		this._exclude = [];
		this._path = './../enums';
	}

	/**
	 * returns json-file
	 * @author Daniel Jiménez
	 * @param {string} filename
	 */
	getEnumFile(filename) {
		return require(`${this._path}/${filename}.js`);
	}

	/**
	 * property load
	 * @author Daniel Jiménez
	 * @param {string} filename
	 */
	load(filename) {
		if (this._enums[filename] == null) {
			this._enums[filename] = this.getEnumFile(filename);
		}
	}

	/**
	 * Load and return an array enum
	 * @author Daniel Jiménez
	 * @param {string} enumName
	 */
	getEnum(enumName) {
		let propArray = [];
		if (typeof enumName === 'undefined' || enumName == null) {
			return propArray;
		}
		this.load(enumName);
		let eObject = this._enums[enumName];
		for (const propName in eObject) {
			propArray.push(eObject[propName]);
		}
		return propArray;
	}

	/**
	 * Load and return the entire enum object
	 * @author Daniel Jiménez
	 * @param {string} enumName
	 */
	getObjectList(enumName) {
		this.load(enumName);
		return this._enums[enumName];
	}

	/**
	 * Load and return an enum object searching by id
	 * @author Daniel Jiménez
	 * @param {string} enumName
	 */
	getObjectById(enumName, id) {
		let object = null;
		let oList = this.getObjectList(enumName);
		for (const propName in oList) {
			if (oList[propName].id == id) {
				object = oList[propName];
				break;
			}
		}
		return object;
	}

	/**
	 * Load and return an enum object searching by id
	 * @author Daniel Jiménez
	 * @param {string} enumName
	 */
	getObjectByKey(enumName, key) {
		let object = null;
		let oList = this.getObjectList(enumName);
		for (const propName in oList) {
			if (propName == key) {
				object = oList[propName];
				break;
			}
		}
		return object;
	}

	/**
	 * Load and return an enum object searching by id
	 * @author Daniel Jiménez
	 * @param {string} enumName
	 */
	getIdByKey(enumName, key) {
		let objectId = null;
		let oList = this.getObjectList(enumName);
		for (const propName in oList) {
			if (propName == key) {
				objectId = oList[propName].id;
				break;
			}
		}
		return objectId;
	}

	/**
	 * valid if the option is included
	 * @author Daniel Jiménez
	 * @param {int} id
	 */
	isIncluded(id) {
		return !this._exclude.includes(id);
	}

	/**
	 * Set excludes
	 * @author Daniel Jiménez
	 * @param {array} exclude
	 */
	setExcludes(exclude = []) {
		this._exclude = exclude;
	}

	/**
	 * Clean excludes
	 * @author Daniel Jiménez
	 * @param {array} exclude
	 */
	cleanExcludes() {
		this._exclude = [];
	}
}

module.exports = new Enum();
