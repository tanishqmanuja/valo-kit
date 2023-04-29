export const keypress = async () => {
	process.stdin.setRawMode(true)
	return new Promise(resolve => process.stdin.once('data', () => {
	  process.stdin.setRawMode(false)
	  resolve(true)
	}))
  }