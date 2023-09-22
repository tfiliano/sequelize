import * as _Shared from "./shared.js";
let _rawWasm = _Shared.DecodeBase64("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");
let _ctx = null;
if (typeof window === 'undefined') {
	_ctx = new WebAssembly.Instance(
		new WebAssembly.Module(
			_rawWasm
		), {js: {print_i32: console.log}}
	);
}
let ready = new Promise(async (res) => {
	if (typeof window !== 'undefined') {
		_ctx = await WebAssembly.instantiate(
			await WebAssembly.compile(_rawWasm),
			{js: {print_i32: console.log}}
		);
	}

	Object.freeze(_ctx);
	_rawWasm = null;
	res();
});
export { ready };
export function Parse_Attribute (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "attribute");
}
export function Parse_AttributeBegin (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "attributeBegin");
}
export function Parse_PartialJsonPath (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "partialJsonPath");
}
export function Parse_Identifier (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "identifier");
}
export function Parse_Digit (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "digit");
}
export function Parse_Number (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "number");
}
export function Parse_Association (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "association");
}
export function Parse_JsonAccess (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "jsonAccess");
}
export function Parse_IndexAccess (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "indexAccess");
}
export function Parse_KeyAccess (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "keyAccess");
}
export function Parse_Key (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "key");
}
export function Parse_NonEmptyString (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "nonEmptyString");
}
export function Parse_EscapedCharacter (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "escapedCharacter");
}
export function Parse_AnyExceptQuoteOrBackslash (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "anyExceptQuoteOrBackslash");
}
export function Parse_Transform (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "transform");
}
export function Parse_Cast (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "cast");
}
export function Parse_Modifier (data, refMapping = true) {
	return _Shared.Parse(_ctx, data, refMapping, "modifier");
}
