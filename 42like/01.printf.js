function printf(format, ...args) {
  const formattedString = formatString(format, args);
  process.stdout.write(formattedString + '\n');
}

function formatString(format, args) {
  let result = '';
  let i = 0;
  let argIndex = 0;

  while (i < format.length) {
    if (format[i] === '%' && i + 1 < format.length) {
      let specifier = '';
      let width = '';
      let precision = '';
      let leftJustify = false;
      i++;

      // Check for left justification
      if (format[i] === '-') {
        leftJustify = true;
        i++;
      }

      // Parse width
      while (i < format.length && '0123456789'.includes(format[i])) {
        width += format[i];
        i++;
      }

      // Parse precision
      if (format[i] === '.') {
        i++;
        while (i < format.length && '0123456789'.includes(format[i])) {
          precision += format[i];
          i++;
        }
      }

      // Get specifier
      if (i < format.length) {
        specifier = format[i];
        i++;
      }

      // Format the argument
      if (argIndex < args.length) {
        result += formatArg(args[argIndex], specifier, parseInt(width) || 0, parseInt(precision) || undefined, leftJustify);
        argIndex++;
      } else {
        result += '%' + (leftJustify ? '-' : '') + width + (precision ? '.' + precision : '') + specifier;
      }
    } else {
      result += format[i];
      i++;
    }
  }

  return result;
}

function formatArg(value, specifier, width, precision, leftJustify) {
  let result = '';

  switch (specifier) {
    case 'd':
    case 'i':
      result = parseInt(value).toString();
      break;
    case 'f':
      result = parseFloat(value).toFixed(precision !== undefined ? precision : 6);
      break;
    case 'e':
      result = parseFloat(value).toExponential(precision !== undefined ? precision : 6);
      break;
    case 'o':
      result = Math.floor(Number(value)).toString(8);
      break;
    case 'x':
      result = Math.floor(Number(value)).toString(16).toLowerCase();
      break;
    case 'X':
      result = Math.floor(Number(value)).toString(16).toUpperCase();
      break;
    case 'c':
      result = String.fromCharCode(value);
      break;
    case 's':
      result = String(value);
      if (precision !== undefined) {
        result = result.substr(0, precision);
      }
      break;
    default:
      return '%' + specifier;
  }

  if (width > result.length) {
    const padding = ' '.repeat(width - result.length);
    result = leftJustify ? result + padding : padding + result;
  }

  return result;
}

printf('Integer: %d', 42);
printf('Float: %f', 3.14159);
printf('Exponential: %e', 1234.5678);
printf('Octal: %o', 64);
printf('Hexadecimal: %x %X', 255, 255);
printf('Character: %c', 65);
printf('String: %s', 'Hello, World!');
printf('Precision: %.2f', 3.14159);
printf('Width: %10d', 42);
printf('Left-justified: %-10d', 42);
