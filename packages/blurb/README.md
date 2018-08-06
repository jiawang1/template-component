# blurb

this component can render text asynchromized, so could be used to resolve i18n related issue.

## Quick Start

## feature

- support nestted blurd
```code
      <Blurb blurbID="qaz" blurbKey="test3">
        <Blurb style={{ color: 'red' }} blurbID="67890" />
      </Blurb>
```
- supprot render to attribute, this case can not support blurb patameters in current version
```code 
 <Blurb blurbID="1234568" render={blurb => <img alt={blurb} />} />
```
## API

Basecally, you should import BlurbProvider component and put it in the root of your "page". And then you can use Blurb component to render text.

- BlurbProvider: used to retrieve and cache i18n related text.
   1. queryBlurb : this prop should be a function returned a promise object, used to retrieve i18n text. 
   2. blurbs: shoudld be array of ids for i18n texts. This prop is optional. Only used to prefetch i18n texts when current page just start mount.
- Blurb: component used to render text.
   1. blurbID: this prop is the ID for current piece of i18n text.
   2. placeHolder: regexp for part of text which should be replaced in i18n text. The default place holder is /(?:\^([^^]+)\^)/g. This   means if your text is : "^who^ says hello world.", "^who^" could be replaced with text you provided in runtime when rendered. You can rededined place holder so you can define your text pattern.
   3. blurbKey: this prop is the key used to map replacements. This is necessary for multiple dynamic replacements case. If your text is "^someone^ ordered ^someclasses^ in every weekend.", you can use blurbKey someone and someclasses to identify texts.

```code
      <Blurb blurbID="1234" >
        <span blurbKey="someone">Tom</span>
        <span blurbKey="someclasses">online ENglish training</span>
      </Blurb>
```

## updating Blurb

Current Blurb component instance is bound to blurbID, this means one instance can not be reseted with blurbID. This is reasonal for normal case. But sometimes React will reuse Blurb instance if two Blurbs with same DOM structure.

```code
    if(this.state.show){
      <Blurb BlurbID="A12345" />
    }else{
      <Blurb BlurbID="B12345" />
    }
```

for this case, if state is changed, React will not create another Blurb instance but try to reuse the same one and reassign the blurbID props. Then you will see error remind in console:

```code
blurbID can not be changed, please add key props for blurb with id A12345 and B12345
```

you can supply prop key to Blurb component to tell React these two Blurb is not the same.

```code
    if(this.state.show){
      <Blurb BlurbID="A12345" key="A12345" />
    }else{
      <Blurb BlurbID="B12345" key="B12345"/>
    }
```
